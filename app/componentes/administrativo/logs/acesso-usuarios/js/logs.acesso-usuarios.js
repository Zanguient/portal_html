/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-acesso-usuarios", ['servicos']) 

.controller("administrativo-acesso-usuariosCtrl", ['$scope',
                                            '$state',
                                            '$http',
                                            '$campos',
                                            '$webapi',
                                            '$apis',
                                            '$filter',
                                            '$autenticacao', 
                                            function($scope,$state,$http,$campos,
                                                     $webapi,$apis,$filter,$autenticacao){ 
   
    var divPortletBodyPrivilegioPos = 0; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo privilégio
    $scope.privilegios = [];
    $scope.camposBusca = [{
                            id: $campos.administracao.webpagesroles.RoleName,
                            ativo: true,  
                            nome: "Privilégio"
                          }];
    $scope.itens_pagina = [10, 20, 50, 100];
    $scope.privilegio = {busca:'', campo_busca : $scope.camposBusca[0], 
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0, 
                      campo_ordenacao : {id: $campos.administracao.webpagesroles.RoleName, order : 0}};    
    
    $scope.roleSelecionada = undefined;     
    $scope.novoPrivilegio = ''; // cadastro
    // Controllers e Methods
    //$scope.todos = {id_controller : 0, ds_controller : 'Todos', selecionado : false};
    $scope.originalControllers = [];                                          
    $scope.controllers = [];
    // flags
    $scope.cadastraNovoPrivilegio = false; // faz exibir a linha para adicionar um novo privilégio
           
                                                
    // Inicialização do controller
    $scope.administrativoAcessoUsuariosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Logs';                          
        $scope.pagina.subtitulo = 'Acesso de Usuários';
        // Busca Privilégios
        $scope.buscaPrivilegios();
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });  
    }; 
                                            
    // ORDENAÇÃO
    /**
      * Modifica a ordenação
      */
    var ordena = function(posCampo){
        if(posCampo >= 0 && posCampo < $scope.camposBusca.length){
            if($scope.privilegio.campo_ordenacao.id !== $scope.camposBusca[posCampo].id){ 
                $scope.privilegio.campo_ordenacao.id = $scope.camposBusca[posCampo].id;
                $scope.privilegio.campo_ordenacao.order = 0; // começa descendente                                 
            }else
                // Inverte a ordenação: ASCENDENTE => DESCENDENTE e vice-versa                                
                $scope.privilegio.campo_ordenacao.order = $scope.privilegio.campo_ordenacao.order === 0 ? 1 : 0;                                
            $scope.buscaPrivilegios(); 
        }
    };
    /**
      * Ordena por nome
      */
    $scope.ordena = function(){
        ordena(0);    
    }
    /**
      * Retorna true se a ordenação está sendo feito por nome de forma crescente
      */
    $scope.estaOrdenadoCrescente = function(){
        return $scope.privilegio.campo_ordenacao.id === $scope.camposBusca[0].id && 
               $scope.privilegio.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por nome de forma decrescente
      */
    $scope.estaOrdenadoDecrescente = function(){
        return $scope.privilegio.campo_ordenacao.id === $scope.camposBusca[0].id && 
               $scope.privilegio.campo_ordenacao.order === 1;    
    };                          
                                            
                                            
                                                
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.privilegio.total_paginas){ 
           $scope.privilegio.pagina = pagina;
           $scope.buscaPrivilegios(); 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.privilegio.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.privilegio.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.setaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.privilegio.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        $scope.buscaPrivilegios();   
    };
     
    // BUSCA
    $scope.filtraPrivilegios = function(filtro){
        $scope.privilegio.busca = filtro;
        $scope.buscaPrivilegios();
    };
    $scope.buscaPrivilegios = function(){
       $scope.showProgress(divPortletBodyPrivilegioPos);    
        
       var filtros = undefined;
       
       // Só considera busca de filtro a partir de três caracteres    
       if($scope.privilegio.busca.length > 0) filtros = {id: $scope.privilegio.campo_busca.id, valor: $scope.privilegio.busca + '%'};        
       // Filtro do grupo empresa => barra administrativa
       if($scope.grupoempresa){
            var filtroGrupoEmpresa = {id: $campos.administracao.webpagesusers.id_grupo, valor: $scope.grupoempresa.id_grupo};
            if(filtros) filtros = [filtros, filtroGrupoEmpresa];
            else filtros = filtroGrupoEmpresa;
       }
        
       $scope.obtendoPrivilegios = true;
       // TEMP
       //$scope.privilegios = [{ RoleId: 1, RoleName: 'Admin'}];
       //$scope.obtendoPrivilegios = false;
       //$scope.hideProgress(divPortletBodyPrivilegioPos);
       $webapi.get($apis.administracao.webpagesroles, [$scope.token, 0, $scope.privilegio.campo_ordenacao.id, 
                                                       $scope.privilegio.campo_ordenacao.order, 
                                                       $scope.privilegio.itens_pagina, $scope.privilegio.pagina],
                   filtros) 
            .then(function(dados){
                $scope.privilegios = dados.Registros;
                $scope.privilegio.total_registros = dados.TotalDeRegistros;
                $scope.privilegio.total_paginas = Math.ceil($scope.privilegio.total_registros / $scope.privilegio.itens_pagina);
                var registroInicial = ($scope.privilegio.pagina - 1)*$scope.privilegio.itens_pagina + 1;
                var registroFinal = registroInicial - 1 + $scope.privilegio.itens_pagina;
                if(registroFinal > $scope.privilegio.total_registros) registroFinal = $scope.privilegio.total_registros;
                $scope.privilegio.faixa_registros =  registroInicial + '-' + registroFinal;
                $scope.obtendoPrivilegios = false;
                $scope.hideProgress(divPortletBodyPrivilegioPos);
                // Verifica se a página atual é maior que o total de páginas
                if($scope.privilegio.pagina > $scope.privilegio.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
              },
              function(failData){
                 $scope.obtendoPrivilegios = false;
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else $scope.showAlert('Houve uma falha ao requisitar privilégios (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyPrivilegioPos);
              }); 
    };
        
                                                                                       
                                                
    // AÇÕES
    /**
      * Exibe cadastro novo privilégio
      */
    $scope.exibeCadastroNovoPrivilegio = function(exibe){
        $scope.cadastraNovoPrivilegio = exibe === undefined || exibe ? true : false;
        $scope.novoPrivilegio = '';
    }
    /**
      * Adiciona privilégio
      */
    $scope.addPrivilegio = function(){
        if(!$scope.novoPrivilegio){
           $scope.showAlert('Insira um nome!',true,'danger',true); 
           return;   
        }
        // Envia para o banco
        $scope.showProgress(divPortletBodyPrivilegioPos);
        $webapi.post($apis.administracao.webpagesroles, $scope.token, {RoleName : $scope.novoPrivilegio})
                .then(function(dados){
                    $scope.showAlert('Privilégio cadastrado com sucesso!', true, 'success', true);
                    // Reseta o campo
                    $scope.novoPrivilegio = '';
                    $scope.hideProgress(divPortletBodyPrivilegioPos);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else $scope.showAlert('Houve uma falha ao cadastrar o privilégio (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyPrivilegioPos);
                  }); 
    }
    /**
      * Exibe as funcionalidades associadas ao privilégio
      */
    $scope.exibeFuncionalidades = function(privilegio){
        // Reseta permissões
        $scope.permissoes = [];
        $scope.roleSelecionada = privilegio;
        // Exibe o modal
        $('#modalFuncionalidades').modal('show');
        // Carrega as permissões
        obtemMódulosEFuncionalidades();
        
    }; 
    /**
      * Excluir privilégio
      */                                            
    var exluirPrivilegio = function(RoleId){
        // Deleta
        $scope.showProgress(divPortletBodyPrivilegioPos);
        $webapi.delete($apis.administracao.webpagesroles,
                       [{id: 'token', valor: $scope.token},{id: 'RoleId', valor: RoleId}])
            .then(function(dados){
                    $scope.showAlert('Privilégio deletado com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyPrivilegioPos);
                    // atualiza tela de privilégios
                    $scope.buscaPrivilegios();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else $scope.showAlert('Houve uma falha ao excluir o privilégio (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyPrivilegioPos);
                  }); 
    };
    /**
      * Solicitação confirmação para excluir o privilégio
      */                                                                              
    $scope.exluirPrivilegio = function(privilegio){
        // Envia post para deletar
        $scope.showModal('Confirmação', 
                         'Tem certeza que deseja excluir ' + privilegio.RoleName,
                         exluirPrivilegio, privilegio.RoleId,
                         'Sim', 'Não');
    };    
                                                
                                                
    
    // CONTROLLERS E METHODS
    /**
      *  Marca/Desmarca todos métodos do controller
      */                                            
    var  selecionaMetodosDoController = function(controller){
        var check = controller.selecionado;
        if(controller.methods) 
            // Marca/Desmarca todos os métodos
            for(var k = 0; k < controller.methods.length; k++) controller.methods[k].selecionado = check;   
    }
    /**
      *  Marca/Desmarca todos a partir do controller
      */
    var selecionaController = function(controller){
        var check = controller.selecionado;
        // Tem métodos?
        selecionaMetodosDoController(controller);
        // Tem sub controllers?
        if(!check && controller.subcontrollers){
            // Marca cada subcontroller, seus métodos e todos os seus filhos
            for(var k = 0; k < controller.subcontrollers.length; k++){
                var sub = controller.subcontrollers[k];
                sub.selecionado = check;
                selecionaController(sub); // recursivo
            }
        }
    };
    /**
      *
      */
    $scope.handleCheckController = function(controller){
        if(!controller) return;
        //console.log(angular.equals($scope.originalControllers, $scope.controllers));
        if(angular.isArray(controller)){
            // é um controller filho
            var ctrlFilho = controller[0];
            var check = ctrlFilho.selecionado;
            selecionaController(ctrlFilho);
            // Se ele acabou de ser marcado => marca os pais
            if(check){
               for(var k = 1; k < controller.length; k++){ 
                   var ctrl = controller[k];
                   ctrl.selecionado = true;
                   // Verifica se tem algum método selecionado do controller
                   // Se não tiver => seleciona todos
                   //if($filter('filter')(ctrl.methods, {selecionado:true}).length == 0)
                   selecionaMetodosDoController(ctrl);
               }
            }/*else{
               // Avalia se deve desmarcar os pais 
               for(var k = 1; k < controller.length; k++){
                   var ctrl = controller[k];
                   if($filter('filter')(ctrl.subcontrollers, {selecionado:true}).length == 0){
                       ctrl.selecionado = false;
                       selecionaMetodosDoController(ctrl);
                   }
                }
            }*/
        /*}else if(controller.id_controller === $scope.todos.id_controller){
            // seleciona/desmarca tudo      
        */}else{
            // Marca do controller para baixo
            selecionaController(controller);
        }
    }
    $scope.handleCheckMethod = function(method, controller){
        if(!method.selecionado){
            // Verifica se ainda tem algum método selecionado
            if($filter('filter')(controller.methods, {selecionado:true}).length == 0){
                // Não tem mais métodos selecionados => Desmarca o controller
                controller.selecionado = false;
                selecionaController(controller);
            }
        }
    }
    /**
      * Carrega todos os módulos e respectivas funcionalidades
      */
    var obtemMódulosEFuncionalidades = function(){
       //$scope.obtendoModulosEFuncionalidades = true;
       $scope.showProgress();
       $webapi.get($apis.administracao.webpagescontrollers, [$scope.token, 2,       
                                                             $campos.administracao.webpagescontrollers.ds_controller], 
                   {id : $campos.administracao.webpagescontrollers.RoleId, valor: $scope.roleSelecionada.RoleId}) 
            .then(function(dados){
                $scope.controllers = dados.Registros;
                // set selecionado dos controllers
                determinaControllersSelecionados($scope.controllers);
                // Faz uma cópia (por valor) do controller proveniente da base de dados
                angular.copy($scope.controllers, $scope.originalControllers);
                //$scope.obtendoModulosEFuncionalidades = false;
                $scope.hideProgress(divPortletBodyPrivilegioPos);
              },
              function(failData){
                 //$scope.obtendoModulosEFuncionalidades = false;
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else $scope.showAlert('Houve uma falha ao requisitar módulos e funcionalidades (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress();
              }); 
    };
    /**
      * Do conjunto de controllers, seleciona os elementos que tem métodos permitidos
      */
    var determinaControllersSelecionados = function(controllers){
        if(!controllers || controllers.length == 0) return;
        for(var k = 0; k < controllers.length; k++){
            var controller = controllers[k];
            // Indica se ele está marcado
            controller.selecionado = $filter('filter')(controller.methods, {selecionado:true}).length > 0;
            // Faz isso com os filhos
            if(controller.subControllers) determinaControllersSelecionados(controller.subControllers);
        }
    };
    /**
      * Retoma as permissões que estão salvas na base de dados
      */
    $scope.resetaPermissoes = function(){
        angular.copy($scope.originalControllers, $scope.controllers);    
    };
    /**
      * Salva as permissões
      */
    $scope.salvaPermissoes = function(){
        // Guarda as permissões
        var permissoes = [];
        // Armazena somente as que tiveram alterações
        obtemPermissoesModificadas($scope.controllers, $scope.originalControllers, permissoes);
        
        // Verifica se tiveram alterações
        if(permissoes.length == 0) console.log("NÃO HOUVE ALTERAÇÕES");
        else console.log(permissoes);
    }; 
    /**
      * Comparando cada método dos controllers novo e original, armazena no array permissoes somente as que foram modificadas
      */
    var obtemPermissoesModificadas = function(newControllers, originalControllers, permissoes){
        for(var k = 0; k < newControllers.length; k++){
            var novo = newControllers[k];
            var original = originalControllers[k];
            armazenaPermissoesModificadas(novo, original, permissoes);
            // Percorre os filhos
            if(novo.subcontrollers) obtemPermissoesModificadas(novo.subcontrollers, original.subcontrollers, permissoes);
        }    
    };
    /**
      * Armazena no array permissoes somente os métodos que foram modificados quanto à seleção
      */                                            
    var armazenaPermissoesModificadas = function(newController, originalController, permissoes){
        for(var k = 0; k < newController.methods.length; k++){
            var novo = newController.methods[k];    
            var original = originalController.methods[k];
            // Evitar erros
            if(novo.selecionado === undefined) novo.selecionado = false;
            if(original.selecionado === undefined) original.selecionado = false;
            // Compara
            if(novo.selecionado !== original.selecionado){
                console.log("DIFERENTES!");
                var json = {id_roles : $scope.roleSelecionada.RoleId,
                            id_method : novo.id_method,
                            fl_principal : novo.home
                           };
                if(!novo.selecionado){
                    // Remove par!
                    json.remover = true; // DEFINIR SE VAI SER ISSO MESMO
                }
                // Coloca no array
                permissoes.push(json);
            }
        }
    };

}])