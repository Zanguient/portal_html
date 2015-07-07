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
                console.log("Criar novo submódulo em " + $scope.moduloSelecionado.text);
            }
          },
          "alterar": {
            "label": "Alterar",
            "action": function(obj) {
              console.log("Alterar " + $scope.moduloSelecionado.text);
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
       $scope.obtendoModulos = true;
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
              }); 
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
                            id : controller.id_controller,
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
        
      
    // MODAL
    var inputType = 'modulo';                                           
    /**
      * Exibe modal com o input
      */
    var exibeModalInput = function(){
        // Exibe o modal
        $('#modalInput').modal('show');
    }                                            
    /**
      * Exibe cadastro novo módulo menu
      */
    $scope.exibeCadastroNovoModuloMenu = function(){
        // Exibe o modal
        $('#modalInput').modal('show');
    }                                            
                                                
                                                
    // AÇÕES
    
    /**
      * Adiciona módulo menu
      */
    $scope.addModuloMenu = function(){
        if(!$scope.novoModuloMenu){
           $scope.showAlert('Insira um nome!',true,'danger',true); 
           return;   
        }
        // Envia para o banco
        $scope.showProgress(divPortletBodyModuloFuncionalidadePos);
        $webapi.post($apis.administracao.webpagescontrollers, $scope.token, 
                     {ds_controller : $scope.novoModuloMenu,
				      fl_menu : 0, // usado para indicar se é a página inicial
				      id_subController : null 
                     })
                .then(function(dados){
                    $scope.showAlert('Módulo cadastrado com sucesso!', true, 'success', true);
                    // Reseta o campo
                    $scope.novoModuloMenu = '';
                    $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else $scope.showAlert('Houve uma falha ao cadastrar o módulo (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyModuloFuncionalidadePos);
                  }); 
    }
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