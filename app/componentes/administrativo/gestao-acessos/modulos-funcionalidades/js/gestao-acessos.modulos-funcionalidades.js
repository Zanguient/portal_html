/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-modulos-funcionalidades", ['servicos']) 

.controller("administrativo-modulos-funcionalidadesCtrl", ['$scope',
                                            '$state',
                                            '$http',
                                            '$campos',
                                            '$webapi',
                                            '$apis',
                                            '$filter',
                                            '$autenticacao', 
                                            function($scope,$state,$http,$campos,
                                                     $webapi,$apis,$filter,$autenticacao){ 
   
    var divPortletBodyModuloFuncionalidadePos = 0; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo usuário
    $scope.modulos = [{text : '', children: [], parent: '#'}];
    $scope.moduloSelecionado = undefined;     
    $scope.novoModuloMenu = ''; // cadastro
    // flags                                            
    $scope.cadastroNovoModuloMenu = false; // faz exibir a linha para adicionar um novo módulo menu
          
                                                
    // Context Menu
    $scope.contextMenu = {
          "novo": {
            "label": "Novo submódulo",
            "disabled" : true,  
            "action": function(data) {
                // Cadastra submódulo
                cadastraNovoModulo($scope.moduloSelecionado);
            }
          },
          "alterar": {
            "label": "Alterar",
            "action": function(obj) {
                alteraNomeModulo($scope.moduloSelecionado);
            }
          },
          "excluir": {
            "label": "Excluir",
            "action": function(obj) {
              console.log("Excluir " + $scope.moduloSelecionado.text);
            }
          }
    };                                            
    
                                                
                                                
    // Inicialização do controller
    $scope.administrativoModulosFuncionalidadesInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Módulos e Funcionalidades';
        // Busca módulos
        $scope.buscaModulos();
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });  
    }; 

     
    // BUSCA
    $scope.buscaModuloJSTree = function(busca){
        var jstree = $('#jstree');//angular.element(document.querySelector('#jstree'));     
        if(jstree) jstree.jstree(true).search(busca);
    };
   
    $scope.buscaModulos = function(){
       $scope.showProgress(divPortletBodyModuloFuncionalidadePos);     
       /*$scope.obtendoModulos = true;
       $webapi.get($apis.administracao.webpagescontrollers, [$scope.token, 2]) 
            .then(function(dados){
                // coloca modulos no formato da jstree  
                $scope.modulos = obtemModulosJSTree(dados.Registros);
                $scope.obtendoModulos = false;
                $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
              },
              function(failData){
                 $scope.obtendoModulos = false;
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else $scope.showAlert('Houve uma falha ao requisitar módulos (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
              });*/
        $scope.modulos = [{text : 'Administração',
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
                        ];
        $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
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
                            id : 'controller' + controller.id_controller,
                            data : {methods: controller.methods, menu : controller.fl_menu },
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
        
   
                                                 
                                                
                                                
    // MODAL ALERTA
    $scope.alerta = {titulo : '', mensagem : '', textoOk : 'Ok', funcaoOk: function(){}};                                       
    /**
      * Exibe modal com a mensagem de alerta
      */
    var exibeModalAlerta = function(mensagem, titulo, textoOk, funcaoOk){
        $scope.alerta.titulo = titulo ? titulo : 'Info';
        $scope.alerta.mensagem = mensagem ? mensagem : 'Mensagem';
        $scope.alerta.textoOk = textoOk ? textoOk : 'Ok';
        $scope.alerta.funcaoOk = typeof funcaoOk === 'function' ? funcaoOk : function(){fechaModalAlerta()};
        // Exibe o modal
        $('#modalAlerta').modal('show');
        if(!$scope.$$phase) $scope.$apply();
    }
    var fechaModalAlerta = function(){
        $('#modalAlerta').modal('hide');    
    };

                                                
      
    // MODAL INPUT
    $scope.input = {titulo : '', mensagem : '', text : '', textoCancela : 'Cancelar',
                    textoConfirma : 'Ok', funcaoConfirma : function(){}};                                       
    /**
      * Exibe modal com o input
      */
    var exibeModalInput = function(mensagem, titulo, textoCancela, textoConfirma, funcaoConfirma, textInit){
        $scope.input.mensagem = mensagem ? mensagem : 'Mensagem';
        $scope.input.titulo = titulo ? titulo : 'Info';
        $scope.input.textoCancela = textoCancela ? textoCancela : 'Cancelar';
        $scope.input.textoConfirma = textoConfirma ? textoConfirma : 'Ok';
        $scope.input.funcaoConfirma = typeof funcaoConfirma === 'function' ? funcaoConfirma : function(){fechaModalInput()};
        $scope.input.text = textInit ? textInit : '';
        // Exibe o modal
        $('#modalInput').modal('show');
        if(!$scope.$$phase) $scope.$apply();
    }
    var fechaModalInput = function(){
        $('#modalInput').modal('hide');    
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
        var titulo = parent ? 'em "' + parent.text + "'" : 'menu';
        var irmaos = parent ? parent.children : $scope.modulos;
        var id_parent = parent ? parent.id : null;
        // Exibe o modal
        exibeModalInput('Informe o nome de exibição do módulo', 'Cadastro de módulo ' + titulo, 'Cancelar', 'Salvar',
                         function(){ 
                                if(!$scope.input.text){
                                    exibeModalAlerta('Informe um nome');
                                    return false;
                                }
                                if($scope.input.text.length < 3){
                                    //alert('Nome muito curto!');
                                    exibeModalAlerta('Nome muito curto!');
                                    return false;    
                                }
                                // Verifica se tem algum de mesmo nome no mesmo nível
                                for(var k = 0; k < irmaos.length; k++){
                                    if($scope.input.text.toUpperCase() === irmaos[k].text.toUpperCase()){
                                        exibeModalAlerta('Já existe um módulo com esse nome no nível desejado!');
                                        return false;    
                                    }
                                }
                                console.log("CADASTRA " + $scope.input.text);
                                /*cadastraModulo({ ds_controller : $scope.input.text,
                                                 id_subController : id_parent,
                                                 fl_menu : 0 // não é página inicial
                                               });*/
                              }); 
    };
    /**
      * Solicita ao usuário o novo nome do novo módulo selecionado e o avalia
      * Em caso de sucesso, requisita ao servidor a atualização
      */
    var alteraNomeModulo = function(node){
        console.log(node)
        // Exibe o modal
        exibeModalInput('Informe o novo nome de exibição do módulo ' + node.text, 
                        'Alteração de módulo', 'Cancelar', 'Salvar',
                         function(){ 
                                // Verifica se houve alteração
                                if($scope.input.text === node.text){
                                    // Não alterou => Nada faz
                                    fechaModalInput();
                                    return true;
                                }
                                if(!$scope.input.text){
                                    exibeModalAlerta('Informe um nome');
                                    return false;
                                }
                                if($scope.input.text.length < 3){
                                    //alert('Nome muito curto!');
                                    exibeModalAlerta('Nome muito curto!');
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
                                        console.log(pai);
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
                                    
                                    if($scope.input.text.toUpperCase() === irmao.text.toUpperCase() && 
                                       irmao.text !== node.text){ // é possível o cidadão alterar o CAPITAL de alguma(s) letra(s) do nome. Por exemplo: TAx Services => Tax Services
                                        exibeModalAlerta('Já existe um módulo com esse nome no nível desejado!');
                                        return false;    
                                    }
                                }
                                console.log("ALTERA " + node.text + " PARA " + $scope.input.text);
                                /*alteraModulo({ ds_controller : $scope.input.text,
                                               id_controller : parent.id,
                                               fl_menu : parent.data.menu // não altera
                                             });*/
                              }, node.text); 
    };                                            
    
    
    
                                                
                                                
    // AÇÕES
    var cadastraModulo = function(jsonModulo){
        if(!jsonModulo) return;
        console.log(jsonModulo);
        // Envia para o banco
        $scope.showProgress();
        $webapi.post($apis.administracao.webpagescontrollers, $scope.token, jsonModulo)
                .then(function(dados){
                    $scope.showAlert('Módulo cadastrado com sucesso!', true, 'success', true);
                    // Dismiss o progress
                    $scope.hideProgress();
                    // Fecha o modal input
                    fechaModalInput();
                    // Recarrega os módulos
                    $scope.buscaModulos();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else $scope.showAlert('Houve uma falha ao cadastrar o módulo (' + failData.status + ')', true, 'danger', true);
                     // Dismiss o progress
                     $scope.hideProgress();
                     // Fecha o modal input
                     fechaModalInput();
                  }); 
    };

    /**
      * Exibe as funcionalidades associadas ao módulo
      */
    $scope.selecionaModulo = function(event,object){
        $scope.moduloSelecionado = object.node;
        if(!$scope.$$phase) $scope.$apply();
    }; 
    /**
      * Excluir módulo
      */                                            
    var exluirModulo = function(id_controller){
        // Deleta
        $scope.showProgress(divPortletBodyModuloFuncionalidadePos);
        $webapi.delete($apis.administracao.webpagescontrollers,
                       [{id: 'token', valor: $scope.token},{id: 'id_controller', valor: id_controller}])
            .then(function(dados){
                    $scope.showAlert('Módulo deletado com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                    // atualiza tela de módulos
                    $scope.buscaModulos();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else $scope.showAlert('Houve uma falha ao excluir o módulo (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                  }); 
    };
    /**
      * Solicitação confirmação para excluir o módulo
      */                                                                              
    $scope.exluirModulo = function(modulo){
        // Envia post para deletar
        $scope.showModal('Confirmação', 
                         'Tem certeza que deseja excluir ' + modulo.ds_controller,
                         exluirModulo, modulo.id_controller,
                         'Sim', 'Não');
    };    
                                                
                                                
    
    // METHODS

}])