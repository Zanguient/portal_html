/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module("administrativo-modulos-funcionalidades", ['jsTree.directive']) 

.controller("administrativo-modulos-funcionalidadesCtrl", ['$scope',
                                            '$state',
                                            '$filter',
                                            '$http',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            function($scope,$state,$filter,$http,/*$campos,*/$webapi,$apis){ 
   
    var divPortletBodyModuloFuncionalidadePos = 0; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo usuário
    $scope.modulos = [{text : '', children: [], parent: '#'}];
    $scope.moduloSelecionado = undefined; 
    $scope.funcionalidadeSelecionada = undefined;                                            
    $scope.novoModuloMenu = ''; // cadastro
    $scope.busca = '';
    // flags
    $scope.cadastrarFuncionalidadesPadrao = true; 
    $scope.exibeTela = false;                                            
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;      
                                                
    // Context Menu
    $scope.contextMenu = {}; 
                                                
    // DRAG AND DROP
    $scope.core = { check_callback : function (operation, node, node_parent, node_position, more){
                            // Avalia a operação mover
                            if(!permissaoAlteracao) return false; // Sem permissão de alteração => Nada faz!
                            if (operation === "move_node" && more && more.core){ 
                                if(node_parent.parent === null){ 
                                    // Não pode mover para o nível de 'Módulos'
                                    $scope.showModalAlerta("Não é possível mover um módulo para esse nível!");
                                    return false;
                                }
                                // Verifica se tem irmão com mesmo nome
                                var jstree = $('#jstree');
                                var pai = jstree.jstree(true)._model.data[node_parent.id];
                                var no = jstree.jstree(true)._model.data[node.id];
                                var irmaos = pai.children;
                                for(var k = 0; k < irmaos.length; k++){
                                    var irmao = jstree.jstree(true)._model.data[irmaos[k]];
                                    if(no.text.toUpperCase() === irmao.text.toUpperCase()){
                                        $scope.showModalAlerta("Já existe um módulo com o nome '" + 
                                                               no.text.toUpperCase() + "' em '" + 
                                                               pai.text.toUpperCase() +  "'");
                                        return false;    
                                    }
                                }
                                // Confirma mudança
                                $scope.showModalConfirmacao('Confirmação', 
                                    "Tem certeza que mover '" + no.text.toUpperCase() + "' para '" + 
                                    pai.text.toUpperCase() +  "'?",
                                    atualizaModulo, { id_controller : parseInt(no.id),
                                                      id_subController : pai.parent !== '#' ? parseInt(pai.id) : -1
                                                    },
                                    'Sim', 'Não');  
                                // Não muda na estrutura! A mudança vai para o banco e uma nova requisição é feita
                                return false;
                            }
                            return true;  //allow all other operations
                        }
                  };
                                                
                                                
    var obtemContextMenu = function(){
        if($scope.usuarioPodeCadastrarModulosFuncionalidades()){ 
            $scope.contextMenu.novo = {
                "label": "Novo submódulo",
                "_disabled" : function(obj) {return $scope.moduloSelecionado.parents.length >= 4;},
                                                    // sub módulo só pode ser criado até o nível 3  
                "action": function(obj) {
                    // Cadastra submódulo
                    cadastraNovoModulo($scope.moduloSelecionado);
                }
              }
        }
        if($scope.usuarioPodeAlterarModulosFuncionalidades()){
            $scope.contextMenu.alterar = {
                "label": "Alterar",
                "_disabled" : function(obj) {return $scope.moduloSelecionado.parents.length == 1;},
                "action": function(obj) {
                    alteraNomeModulo($scope.moduloSelecionado);
                }
              }    
        }
        if($scope.usuarioPodeExcluirModulosFuncionalidades()){
            $scope.contextMenu.excluir = {
                "label": "Excluir",
                "_disabled" : function(obj) {return $scope.moduloSelecionado.parents.length == 1;},  
                "action": function(obj) {
                    // Solicitação confirmação para excluir o módulo
                    text = "Tem certeza que deseja excluir '" + $scope.moduloSelecionado.text.toUpperCase() + "'?";
                    if($scope.moduloSelecionado.parents.length < 4 && $scope.moduloSelecionado.children.length > 0){
                        // Alerta sobre a exclusão dos módulos filhos
                        text += "\n\r(OBS: A exclusão deste módulo também excluirá todos os submódulos dele)";
                    }
                    $scope.showModalConfirmacao('Confirmação', text,
                             exluirModulo, parseInt($scope.moduloSelecionado.id),
                             'Sim', 'Não');
                }
              }
        }    
    };
                                                
                                                
    // Inicialização do controller
    $scope.administrativoModulosFuncionalidadesInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Módulos e Funcionalidades';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });  
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){// && $scope.methodsDoControllerCorrente.length > 0){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'ATUALIZAÇÃO' }).length > 0;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'CADASTRO' }).length > 0;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'REMOÇÃO' }).length > 0;
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Busca módulos
            $scope.buscaModulos();
        }); 
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Obtem Context Menu a partir das permissões
        obtemContextMenu();
        // Busca módulos
        //$scope.buscaModulos();
    };
                                                
                                                
    // PERMISSÕES                                           
    /**
      * Retorna true se o usuário pode cadastrar módulos e funcionalidades
      */
    $scope.usuarioPodeCadastrarModulosFuncionalidades = function(){
        return permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar módulos e funcionalidades
      */
    $scope.usuarioPodeAlterarModulosFuncionalidades = function(){
        return permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir módulos e funcionalidades
      */
    $scope.usuarioPodeExcluirModulosFuncionalidades = function(){
        return permissaoRemocao;
    }                                           
                                                
                                                

     
    // BUSCA
    $scope.resetaBusca = function(){
        $scope.busca = '';
        $scope.buscaModuloJSTree();
    };
    $scope.buscaModuloJSTree = function(){//busca){
        var jstree = $('#jstree');//angular.element(document.querySelector('#jstree'));     
        if(jstree) jstree.jstree(true).search($scope.busca);
    };
   
    $scope.buscaModulos = function(){
       $scope.showProgress(divPortletBodyModuloFuncionalidadePos);     
       $scope.obtendoModulos = true;
       $webapi.get($apis.getUrl($apis.administracao.webpagescontrollers, [$scope.token, 2])) 
            .then(function(dados){
                // coloca modulos no formato da jstree  
                //$scope.modulos = obtemModulosJSTree(dados.Registros);
                $scope.modulos = [{text: 'Módulos', id: '0', state: {opened: true}}];
                $scope.modulos[0].children = obtemModulosJSTree(dados.Registros);
                $scope.obtendoModulos = false;
                $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
              },
              function(failData){
                 $scope.obtendoModulos = false;
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao requisitar módulos (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
              });
            /*$scope.modulos = [{text : 'Módulos',
                               id : 'controller0',
                               state: {opened: true},
                               children : [
                                   {text : 'Administração',
                                    id : 'controller50',
                                    //parent : '#',
                                    data : { methods : [], menu : 0 },
                                    state: {opened: true},
                                    children : [
                                       {text : 'Gestão de Acessos',
                                        id : 'controller51',
                                        //parent : 50,
                                        data : { methods : [], menu : 0 },
                                        state: {opened: true},
                                        children : [
                                            {text : 'Usuários',
                                             id : 'controller53',
                                             //parent : 51,
                                             data : { methods : [], menu : 0 }
                                            },
                                             {text : 'Privilégios',
                                             id : 'controller54',
                                             //parent : 51,
                                             data : { methods : [], menu : 0 }
                                            }
                                         ]
                                       },
                                       {text : 'Logs',
                                        id : 'controller52',
                                        //parent : 50,
                                        data : { methods : [], menu : 0 },
                                        state: {opened: true},
                                        children : [
                                            {text : 'Acesso de Usuários',
                                             id : 'controller55',
                                             //parent : 52,
                                             data : { methods : [], menu : 0 }
                                            }
                                         ]
                                       }
                                ]
                              }
                            ]
                          }];
        $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);*/
    };
    /**
      * Obtem o array dos controllers no formato de jstree
      */
    var obtemModulosJSTree = function(controllers){
        var array = [];
        if(controllers && angular.isArray(controllers)){
            for(var k = 0; k < controllers.length; k++){
                var controller = controllers[k];
                var json = {text : controller.ds_controller,
                            id : '' + controller.id_controller,
                            data : {methods: controller.methods },
                            state: {opened: true},
                            //icon : 'fa fa-square'
                           };
                if(controller.subControllers && controller.subControllers.length > 0) 
                    json.children = obtemModulosJSTree(controller.subControllers);
                array.push(json);    
            }  
        }
        return array;
    };
        
                                                
                                                
                                                
    /**
      * Exibe cadastro um novo módulo menu
      */
    $scope.cadastraModuloMenu = function(){
        cadastraNovoModulo(); // não existe pai
    } 
    /**
      * Solicita ao usuário o nome do novo módulo e o avalia.
      * Em caso de sucesso, requisita ao servidor o cadastro
      */
    var cadastraNovoModulo = function(parent){
        //console.log(parent);
        var irmaos = parent ? parent.children : $scope.modulos[0].children;
        var id_parent = parent && parent.id !== '0' ? parseInt(parent.id) : null;
        // Exibe o modal
        $scope.cadastrarFuncionalidadesPadrao = true;    
        $scope.showModalInput('Informe o nome de exibição do módulo', 'Cadastro de módulo em ' + parent.text, 
                              'Cancelar', 'Salvar',
                         function(text){ 
                                if(!text){
                                    $scope.showModalAlerta('Informe um nome');
                                    return false;
                                }
                                if(text.length < 3){
                                    //alert('Nome muito curto!');
                                    $scope.showModalAlerta('Nome muito curto!');
                                    return false;    
                                }
                                //console.log(irmaos);
                                var jstree = $('#jstree');
                                // Verifica se tem algum de mesmo nome no mesmo nível
                                for(var k = 0; k < irmaos.length; k++){
                                    var irmao = irmaos[k];
                                    if(!irmao.text) irmao = jstree.jstree(true)._model.data[irmao];
                                    if(text.toUpperCase() === irmao.text.toUpperCase()){
                                        $scope.showModalAlerta('Já existe um módulo com esse nome no nível desejado!');
                                        return false;    
                                    }
                                }
                                // Fecha o modal input
                                $scope.fechaModalInput();
                                // Cadastra
                                cadastraModulo({ ds_controller : text,
                                                 id_subController : id_parent
                                               }, $scope.cadastrarFuncionalidadesPadrao);
                                return true;
                              }, '', true, 'Cadastrar funcionalidades padrão', $scope.cadastrarFuncionalidadesPadrao, 
                                    function(checked){
                                       $scope.cadastrarFuncionalidadesPadrao = checked;
                                    }); 
    };
    /**
      * Solicita ao usuário o novo nome do novo módulo selecionado e o avalia
      * Em caso de sucesso, requisita ao servidor a atualização
      */
    var alteraNomeModulo = function(node){
        //console.log(node)
        // Exibe o modal
        $scope.showModalInput('Informe o novo nome de exibição do módulo ' + node.text, 
                        'Alteração de módulo', 'Cancelar', 'Salvar',
                         function(text){ 
                                // Verifica se houve alteração
                                if(text === node.text){
                                    // Não alterou => Nada faz
                                    $scope.fechaModalInput();
                                    return true;
                                }
                                if(!text){
                                    $scope.showModalAlerta('Informe um nome');
                                    return false;
                                }
                                if(text.length < 3){
                                    $scope.showModalAlerta('Nome muito curto!');
                                    return false;    
                                }
                                // Busca o pai
                                var irmaos = [];
                                var jstree = undefined;
                                if(node.parent === '#') irmaos = $scope.modulos;
                                else{
                                    jstree = $('#jstree');
                                    var pai = undefined;
                                    if(jstree){
                                        pai = jstree.jstree(true)._model.data[node.parent];
                                        if(pai) irmaos = pai.children;
                                        else console.log("FALHA AO OBTER PAI");
                                    }else console.log("FALHA AO OBTER JSTREE");
                                }     
                                // Verifica se tem algum de mesmo nome no mesmo nível (que não seja ele mesmo)
                                for(var k = 0; k < irmaos.length; k++){
                                    var irmao = irmaos[k];
                                    if(!irmao.text)
                                        // busca o rapaz
                                        irmao = jstree.jstree(true)._model.data[irmao];
                                    
                                    if(text.toUpperCase() === irmao.text.toUpperCase() && 
                                       irmao.text !== node.text){ // é possível o cidadão alterar o CAPITAL de alguma(s) letra(s) do nome. Por exemplo: TAx Services => Tax Services
                                        $scope.showModalAlerta('Já existe um módulo com esse nome no nível desejado!');
                                        return false;    
                                    }
                                }
                                // Fecha o modal input
                                $scope.fechaModalInput();
                                // Atualiza
                                atualizaModulo({ id_controller : parseInt(node.id), 
                                                 ds_controller : text
                                               });
                                return true;
                              }, node.text); 
    };                                            
    
    
    
                                                
                                                
    // AÇÕES
    /**
      * Exibe as funcionalidades associadas ao módulo
      */
    $scope.selecionaModulo = function(event,object){
        $scope.moduloSelecionado = object.node;
        $scope.funcionalidadeSelecionada = $scope.moduloSelecionado.data && $scope.moduloSelecionado.data !== null ? $scope.moduloSelecionado.data.methods[0] : undefined;
        if(!$scope.$$phase) $scope.$apply();
    };                                             
    /**
      * Cadastra efetivamente o módulo
      */
    var cadastraModulo = function(jsonModulo, cadastrarFuncionalidadesPadrao){
        if(!jsonModulo) return;
        // Constroi o json
        if(!cadastrarFuncionalidadesPadrao) cadastrarFuncionalidadesPadrao = false;
        var json = {webpagescontrollers : jsonModulo, methodspadrao : cadastrarFuncionalidadesPadrao};
        // Envia para o banco
        $scope.showProgress(divPortletBodyModuloFuncionalidadePos);
        $webapi.post($apis.getUrl($apis.administracao.webpagescontrollers, undefined, 
                                  {id: 'token', valor: $scope.token}), json)
                .then(function(id_controller){
                    $scope.showAlert('Módulo cadastrado com sucesso!', true, 'success', true);
                    // Dismiss o progress
                    $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                    // Recarrega os módulos
                    $scope.buscaModulos();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao cadastrar o módulo (' + failData.status + ')', true, 'danger', true);
                     // Dismiss o progress
                     $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                  }); 
    };
    /**
      * Atualiza efetivamente o nome do módulo
      */
    var atualizaModulo = function(jsonModulo){
        $scope.showProgress(divPortletBodyModuloFuncionalidadePos);

        $webapi.update($apis.getUrl($apis.administracao.webpagescontrollers, undefined,
                       {id: 'token', valor: $scope.token}), jsonModulo)
            .then(function(dados){
                    $scope.showAlert('Módulo alterado com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                    // Recarrega os módulos
                    $scope.buscaModulos();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao alterar o módulo (' + failData.status + ')', true, 'danger', true); 
                     $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                  });  
    };                                            
    /**
      * Excluir módulo
      */                                            
    var exluirModulo = function(id_controller){
        // Deleta
        $scope.showProgress(divPortletBodyModuloFuncionalidadePos);
        $webapi.delete($apis.getUrl($apis.administracao.webpagescontrollers, undefined,
                       [{id: 'token', valor: $scope.token},{id: 'id_controller', valor: id_controller}]))
            .then(function(dados){
                    $scope.showAlert('Módulo excluído com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                    // Recarrega os módulos
                    $scope.buscaModulos();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao excluir o módulo (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                  }); 
    };
                                                
                                                
    
    // METHODS
    /**
      * Solicita nome do novo método
      */
    $scope.cadastraNovoMetodo = function(){
        // Exibe o modal
        $scope.showModalInput('Informe o nome de exibição do método', 'Cadastro de método em ' + $scope.moduloSelecionado.text, 
                              'Cancelar', 'Salvar',
                         function(text){ 
                                if(!text){
                                    $scope.showModalAlerta('Informe um nome');
                                    return false;
                                }
                                if(text.length < 3){
                                    $scope.showModalAlerta('Nome muito curto!');
                                    return false;    
                                }
                                // Verifica se tem algum de mesmo nome
                                for(var k = 0; k < $scope.moduloSelecionado.data.methods.length; k++){
                                    if(text.toUpperCase() === $scope.moduloSelecionado.data.methods[k].ds_method.toUpperCase()){
                                        $scope.showModalAlerta('Já existe um método com esse nome!');
                                        return false;    
                                    }
                                }
                                // Verifica se o nome é "Filtro Empresa"
                                if(text.toUpperCase() === 'FILTRO EMPRESA' && 
                                   $scope.moduloSelecionado.text.toUpperCase() !== 'ADMINISTRATIVO'){
                                    $scope.showModalAlerta('Não é permitido cadastrar essa funcionalidade no módulo selecionado!');
                                    return false;
                                }
                                // Fecha o modal input
                                $scope.fechaModalInput();
                                // Cadastra
                                cadastraMetodo({ ds_method : text,
                                                 id_controller : parseInt($scope.moduloSelecionado.id)
                                               });
                                return true;
                              }); 
    };
    /**
      * Solicita novo nome do método
      */
    $scope.alteraNomeMetodo = function(){
        //console.log($scope.funcionalidadeSelecionada);
        // Exibe o modal
        $scope.showModalInput('Informe o novo nome de exibição do método ' + $scope.funcionalidadeSelecionada.ds_method, 
                        'Alteração de método', 'Cancelar', 'Salvar',
                         function(text){ 
                                // Verifica se houve alteração
                                if(text === $scope.funcionalidadeSelecionada.ds_method){
                                    // Não alterou => Nada faz
                                    $scope.fechaModalInput();
                                    return true;
                                }
                                if(!text){
                                    $scope.showModalAlerta('Informe um nome');
                                    return false;
                                }
                                if(text.length < 3){
                                    $scope.showModalAlerta('Nome muito curto!');
                                    return false;    
                                }  
                                // Verifica se tem algum de mesmo nome (que não seja ele mesmo)
                                for(var k = 0; k < $scope.moduloSelecionado.data.methods.length; k++){
                                    var metodo = $scope.moduloSelecionado.data.methods[k];
                                    if(text.toUpperCase() === metodo.ds_method.toUpperCase() && 
                                       metodo.ds_method !== $scope.funcionalidadeSelecionada.ds_method){ // é possível o cidadão alterar o CAPITAL de alguma(s) letra(s) do nome
                                        $scope.showModalAlerta('Já existe um método com esse nome!');
                                        return false;    
                                    }
                                }
                                // Verifica se o nome é "Filtro Empresa"
                                if(text.toUpperCase() === 'FILTRO EMPRESA' && 
                                   $scope.moduloSelecionado.text.toUpperCase() !== 'ADMINISTRATIVO'){
                                    $scope.showModalAlerta('Não é permitido cadastrar essa funcionalidade no módulo selecionado!');
                                    return false;
                                }
                                // Fecha o modal input
                                $scope.fechaModalInput();
                                // Atualiza
                                atualizaMetodo($scope.funcionalidadeSelecionada, text);
                                return true;
                              }, $scope.funcionalidadeSelecionada.ds_method); 
    };
    /**
      * Solicita confirmação da exclusão do método selecionado
      */
    $scope.excluirMetodo = function(){
        $scope.showModalConfirmacao('Confirmação', 
                                    'Tem certeza que deseja excluir ' + $scope.funcionalidadeSelecionada.ds_method + '?',
                 excluirMetodo, $scope.funcionalidadeSelecionada.id_method,
                 'Sim', 'Não');    
    };
    
    /**
      * Cadastra efetivamente o módulo
      */
    var cadastraMetodo = function(jsonMetodo){
        if(!jsonMetodo) return;

        // Envia para o banco
        $scope.showProgress(divPortletBodyModuloFuncionalidadePos);
        $webapi.post($apis.getUrl($apis.administracao.webpagesmethods, undefined,
                                  {id: 'token', valor: $scope.token}), jsonMetodo)
                .then(function(id_method){
                    $scope.showAlert('Método cadastrado com sucesso!', true, 'success', true);
                    // Dismiss o progress
                    $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                    // Adiciona o novo método de forma ordenada (por ds_method)
                    var newMethod = {id_method : id_method, ds_method : jsonMetodo.ds_method};
                    var k = 0;
                    for(k = 0; k < $scope.moduloSelecionado.data.methods.length; k++){
                        if(newMethod.ds_method < $scope.moduloSelecionado.data.methods[k].ds_method){
                            $scope.moduloSelecionado.data.methods.splice(k, 0, newMethod);
                            break;    
                        }
                    }
                    if(k == $scope.moduloSelecionado.data.methods.length)
                        // Não adicionou => Adiciona ao final 
                        $scope.moduloSelecionado.data.methods.splice(k, 0, newMethod);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao cadastrar o método (' + failData.status + ')', true, 'danger', true);
                     // Dismiss o progress
                     $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                  }); 
    };                                            
    /**
      * Atualiza efetivamente o nome do método
      */
    var atualizaMetodo = function(method, novoNome){
        $scope.showProgress(divPortletBodyModuloFuncionalidadePos);
        var jsonMethod = {id_method : method.id_method, ds_method : novoNome};
        console.log(jsonMethod);
        
        $webapi.update($apis.getUrl($apis.administracao.webpagesmethods, undefined,
                       {id: 'token', valor: $scope.token}), jsonMethod)
            .then(function(dados){
                    $scope.showAlert('Método alterado com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                    // Altera o nome
                    method.ds_method = novoNome;
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao alterar o método (' + failData.status + ')', true, 'danger', true); 
                     $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                  });  
    };
    /**
      * Exclui efetivamente o método
      */
    var excluirMetodo = function(id_method){
        // Deleta
        $scope.showProgress(divPortletBodyModuloFuncionalidadePos);
        $webapi.delete($apis.getUrl($apis.administracao.webpagesmethods, undefined,
                       [{id: 'token', valor: $scope.token},{id: 'id_method', valor: id_method}]))
            .then(function(dados){
                    $scope.showAlert('Método excluído com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                    // Remove do array
                    var index = $scope.moduloSelecionado.data.methods.indexOf($scope.funcionalidadeSelecionada);
                    $scope.moduloSelecionado.data.methods.splice(index,1);
                    // Atualiza o flag
                    $scope.funcionalidadeSelecionada = undefined;
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao excluir o método (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                  });  
    };                                            
                                                

}])